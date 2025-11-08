import React from 'react';
import { Recommendation } from '../types';
import { AppleIcon, DumbbellIcon } from './Icons';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Split content into lines and filter out empty ones
  const lines = content.split('\n').filter(line => line.trim() !== '');

  // Convert each line into a preliminary React element (p, h2, h3, or a special 'li' type)
  const elements = lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('### ')) {
      return { type: 'h3', content: trimmedLine.substring(4), key: index };
    }
    if (trimmedLine.startsWith('## ')) {
      return { type: 'h2', content: trimmedLine.substring(3), key: index };
    }
    // Handle both '*' and '-' for list items for more robustness
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      return { type: 'li', content: trimmedLine.substring(2), key: index };
    }
    return { type: 'p', content: trimmedLine, key: index };
  });

  // FIX: Replaced `JSX.Element` with `React.ReactElement` to fix a type error where the JSX namespace was not found.
  const renderedElements: React.ReactElement[] = [];
  let listItems: { type: string; content: string; key: number }[] = [];

  // Group consecutive list items into a single <ul>
  elements.forEach((el, index) => {
    if (el.type === 'li') {
      listItems.push(el);
    } else {
      // If we encounter a non-list item and have a list pending, render it first
      if (listItems.length > 0) {
        renderedElements.push(
          <ul key={`ul-${index}`} className="space-y-2 mt-2">
            {listItems.map(item => (
              <li key={item.key} className="flex items-start">
                <span className="text-sky-400 mr-3 mt-1">&#9670;</span>
                <span>{item.content}</span>
              </li>
            ))}
          </ul>
        );
        listItems = []; // Reset the list
      }
      
      // Render the current non-list item
      if (el.type === 'h2') {
        renderedElements.push(<h2 key={el.key} className="text-xl font-bold text-sky-400 mt-5 mb-3">{el.content}</h2>);
      } else if (el.type === 'h3') {
        renderedElements.push(<h3 key={el.key} className="text-lg font-semibold text-sky-300 mt-4 mb-2">{el.content}</h3>);
      } else {
        renderedElements.push(<p key={el.key} className="mb-2 text-slate-300">{el.content}</p>);
      }
    }
  });

  // If the content ends with a list, render the remaining list items
  if (listItems.length > 0) {
    renderedElements.push(
      <ul key="ul-last" className="space-y-2 mt-2">
        {listItems.map(item => (
          <li key={item.key} className="flex items-start">
            <span className="text-sky-400 mr-3 mt-1">&#9670;</span>
            <span>{item.content}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <div>{renderedElements}</div>;
};


export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className="mt-8 w-full">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <AppleIcon className="w-10 h-10 text-green-400 flex-shrink-0" />
            <h3 className="text-2xl font-semibold text-green-400">Diet Plan</h3>
          </div>
          <div className="text-slate-300 space-y-2 flex-grow">
            <MarkdownRenderer content={recommendation.diet} />
          </div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <DumbbellIcon className="w-10 h-10 text-red-400 flex-shrink-0" />
            <h3 className="text-2xl font-semibold text-red-400">Exercise Routine</h3>
          </div>
          <div className="text-slate-300 space-y-2 flex-grow">
             <MarkdownRenderer content={recommendation.exercise} />
          </div>
        </div>
      </div>
    </div>
  );
};